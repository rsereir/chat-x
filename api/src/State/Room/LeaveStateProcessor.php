<?php

namespace App\State\Room;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Room;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

final class LeaveStateProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly PersistProcessor $decorator,
        private readonly Security $security,
        private readonly HubInterface $mercureHub,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Room
    {
        $user = $this->security->getUser();

        if ($data->getMembers()->contains($user)) {
            $data->removeMember($user);

            try {
                $update = new Update(
                    '/api/rooms/members',
                    json_encode([
                        'roomId' => $data->getId(),
                        'roomName' => $data->getName(),
                        'user' => [
                            'id' => $user->getId(),
                            'username' => $user->getUsername(),
                        ],
                        'action' => 'left',
                        'members' => array_map(fn($member) => [
                            'id' => $member->getId(),
                            'username' => $member->getUsername(),
                        ], $data->getMembers()->toArray()),
                    ])
                );

                $this->mercureHub->publish($update);
            } catch (\Exception $e) {
                error_log('Failed to send Mercure update for user leaving room: ' . $e->getMessage());
            }
        }

        return $this->decorator->process($data, $operation, $uriVariables, $context);
    }
}
