<?php

namespace App\State\Message;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Message;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;

final class NewStateProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly PersistProcessor $decorator,
        private readonly Security $security,
        private readonly HubInterface $mercureHub,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Message
    {
        $user = $this->security->getUser();
        if (!$data->getAuthor()) {
            $data->setAuthor($user);
        }

        $message = $this->decorator->process($data, $operation, $uriVariables, $context);

        try {
            $update = new Update(
                '/api/messages',
                json_encode([
                    'id' => $message->getId(),
                    'content' => $message->getContent(),
                    'createdAt' => $message->getCreatedAt()->format('c'),
                    'author' => [
                        'id' => $message->getAuthor()?->getId(),
                        'username' => $message->getAuthor()?->getUsername(),
                    ],
                    'room' => [
                        'id' => $message->getRoom()?->getId(),
                        'name' => $message->getRoom()?->getName(),
                    ],
                ])
            );

            $this->mercureHub->publish($update);
        } catch (\Exception $e) {
            error_log('Failed to send Mercure update: ' . $e->getMessage());
        }

        return $message;
    }
}
