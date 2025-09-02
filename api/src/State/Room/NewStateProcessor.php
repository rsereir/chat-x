<?php

namespace App\State\Room;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Room;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

final readonly class NewStateProcessor implements ProcessorInterface
{
    public function __construct(
        private PersistProcessor $decorator,
        private Security $security,
        private HubInterface $mercureHub,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Room
    {
        $user = $this->security->getUser();

        if ($user) {
            $data->setOwner($user);
            $data->addMember($user);
        }

        $room = $this->decorator->process($data, $operation, $uriVariables, $context);

        try {
            $update = new Update(
                '/api/rooms',
                json_encode([
                    'id' => $room->getId(),
                    'name' => $room->getName(),
                    'owner' => [
                        'id' => $room->getOwner()?->getId(),
                        'username' => $room->getOwner()?->getUsername(),
                    ],
                    'members' => array_map(fn($member) => [
                        'id' => $member->getId(),
                        'username' => $member->getUsername(),
                    ], $room->getMembers()->toArray()),
                ])
            );

            $this->mercureHub->publish($update);
        } catch (\Exception $e) {
            error_log('Failed to send Mercure update for new room: ' . $e->getMessage());
        }

        return $room;
    }
}
