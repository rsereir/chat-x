<?php

namespace App\State\UserPresence;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\UserPresence;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

final class HeartbeatStateProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly Security $security,
        private readonly HubInterface $mercureHub,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): JsonResponse
    {
        $user = $this->security->getUser();
        $room = $data->getRoom();

        if (!$room || !$user) {
            return new JsonResponse(['error' => 'Invalid request'], 400);
        }

        if (!$room->getMembers()->contains($user)) {
            return new JsonResponse(['error' => 'Access denied'], 403);
        }

        $presence = $this->entityManager->getRepository(UserPresence::class)
            ->findOneBy(['user' => $user, 'room' => $room]);

        $wasOnline = $presence && $presence->getIsOnline();
        $now = new \DateTime();

        if (!$presence) {
            $presence = new UserPresence();
            $presence->setUser($user);
            $presence->setRoom($room);
            $this->entityManager->persist($presence);
        }

        $presence->setLastSeen($now);
        $this->entityManager->flush();

        $isNowOnline = $presence->getIsOnline();

        if (!$wasOnline && $isNowOnline) {
            try {
                $update = new Update(
                    "/api/rooms/{$room->getId()}/presence",
                    json_encode([
                        'userId' => $user->getId(),
                        'username' => $user->getUsername(),
                        'isOnline' => true,
                        'lastSeen' => $now->format('c'),
                    ])
                );
                $this->mercureHub->publish($update);
            } catch (\Exception $e) {
                error_log('Failed to send presence update: ' . $e->getMessage());
            }
        }

        return new JsonResponse(['status' => 'ok', 'lastSeen' => $now->format('c')]);
    }
}