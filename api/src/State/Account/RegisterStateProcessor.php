<?php

namespace App\State\Account;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Account;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class RegisterStateProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $entityManager,
        private readonly UserPasswordHasherInterface $passwordHasher,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Account
    {
        if ($data->plainPassword) {
            $hashedPassword = $this->passwordHasher->hashPassword($data, $data->plainPassword);
            $data->setPassword($hashedPassword);
            $data->plainPassword = null; // Clear plain password
        }

        $this->entityManager->persist($data);
        $this->entityManager->flush();

        return $data;
    }
}
