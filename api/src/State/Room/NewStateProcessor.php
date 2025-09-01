<?php

namespace App\State\Room;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Room;
use Symfony\Bundle\SecurityBundle\Security;

final readonly class NewStateProcessor implements ProcessorInterface
{
    public function __construct(
        private PersistProcessor $decorator,
        private Security $security,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Room
    {
        $user = $this->security->getUser();

        if ($user) {
            $data->setOwner($user);
            $data->addMember($user);
        }

        return $this->decorator->process($data, $operation, $uriVariables, $context);
    }
}
