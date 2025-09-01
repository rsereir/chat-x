<?php

namespace App\EventListener\JWT;

use App\Entity\Account;
use Lexik\Bundle\JWTAuthenticationBundle\Event\JWTCreatedEvent;
use Lexik\Bundle\JWTAuthenticationBundle\Events;
use Symfony\Component\EventDispatcher\Attribute\AsEventListener;

#[AsEventListener(event: Events::JWT_CREATED)]
class JWTCreatedListener
{
    public function onLexikJwtAuthenticationOnJwtCreated(JWTCreatedEvent $event): void
    {
        /** @var Account $account */
        $account = $event->getUser();

        $payload = $event->getData();
        $payload['id'] = $account->getId();

        $event->setData($payload);
    }
}
