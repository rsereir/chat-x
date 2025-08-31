<?php

namespace App\State;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Room;
use Symfony\Bundle\SecurityBundle\Security;

final class RoomStateProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly PersistProcessor $decorator,
        private readonly Security $security,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Room
    {
        $user = $this->security->getUser();
        if ($user) {
            $data->setOwner($user);
        }

        return $this->decorator->process($data, $operation, $uriVariables, $context);
    }
}