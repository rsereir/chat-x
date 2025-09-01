<?php

namespace App\State\Room;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Room;
use Symfony\Bundle\SecurityBundle\Security;

final class JoinStateProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly PersistProcessor $decorator,
        private readonly Security $security,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Room
    {
        $user = $this->security->getUser();

        if (!$data->getMembers()->contains($user)) {
            $data->addMember($user);
            $user->addRoom($data);
        }

        return $this->decorator->process($data, $operation, $uriVariables, $context);
    }
}
