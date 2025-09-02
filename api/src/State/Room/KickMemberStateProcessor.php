<?php

namespace App\State\Room;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Room;
use App\Repository\AccountRepository;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

final class KickMemberStateProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly PersistProcessor $decorator,
        private readonly AccountRepository $accountRepository,
        private readonly HubInterface $mercureHub,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Room
    {
        $memberToKick = $this->accountRepository->find($context['request']->attributes->get('_api_query_parameters')['user']);

        if (!$memberToKick) {
            throw new NotFoundHttpException('Member not found');
        }

        $data->removeMember($memberToKick);

        $room = $this->decorator->process($data, $operation, $uriVariables, $context);

        try {
            $update = new Update(
                '/api/rooms/members',
                json_encode([
                    'roomId' => $room->getId(),
                    'roomName' => $room->getName(),
                    'user' => [
                        'id' => $memberToKick->getId(),
                        'username' => $memberToKick->getUsername(),
                    ],
                    'action' => 'kicked',
                    'members' => array_map(fn($member) => [
                        'id' => $member->getId(),
                        'username' => $member->getUsername(),
                    ], $room->getMembers()->toArray()),
                ])
            );

            $this->mercureHub->publish($update);
        } catch (\Exception $e) {
            error_log('Failed to send Mercure update for user being kicked from room: ' . $e->getMessage());
        }

        return $room;
    }
}
