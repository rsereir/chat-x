<?php

namespace App\Tests\Controller;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use App\Factory\AccountFactory;
use App\Factory\MessageFactory;
use App\Factory\RoomFactory;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Zenstruck\Foundry\Test\Factories;
use Zenstruck\Foundry\Test\ResetDatabase;

class MessageTest extends ApiTestCase
{
    use ResetDatabase, Factories;

    private function getAuthenticatedClient($user = null)
    {
        $user = $user ?: AccountFactory::createOne();
        $client = static::createClient();
        $client->loginUser($user->_real());
        return $client;
    }

    public function testGetMessagesCollection(): void
    {
        $user = AccountFactory::createOne();
        $room = RoomFactory::createOne();
        MessageFactory::createMany(5, ['room' => $room, 'author' => $user]);

        $response = $this->getAuthenticatedClient($user)->request('GET', '/messages', [
            'query' => ['room' => $room->getId()]
        ]);

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
    }

    public function testGetMessage(): void
    {
        $user = AccountFactory::createOne();
        $room = RoomFactory::createOne();
        $message = MessageFactory::createOne(['room' => $room, 'author' => $user]);

        $response = $this->getAuthenticatedClient($user)->request('GET', '/messages/' . $message->getId());

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
    }

    public function testCreateMessage(): void
    {
        $user = AccountFactory::createOne();
        $room = RoomFactory::createOne();

        $response = $this->getAuthenticatedClient($user)->request('POST', '/messages', [
            'json' => [
                'content' => 'Hello, world!',
                'room' => '/rooms/' . $room->getId()
            ]
        ]);

        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
    }

    public function testCreateMessageDispatchesMercureUpdate(): void
    {
        $user = AccountFactory::createOne();
        $room = RoomFactory::createOne();

        $hubMock = $this->createMock(HubInterface::class);
        $hubMock->expects($this->once())
            ->method('publish')
            ->with($this->isInstanceOf(Update::class));

        static::getContainer()->set('mercure.hub', $hubMock);

        $response = $this->getAuthenticatedClient($user)->request('POST', '/messages', [
            'json' => [
                'content' => 'Hello, world!',
                'room' => '/rooms/' . $room->getId()
            ]
        ]);

        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
    }

    public function testCreateMessageWithEmptyContent(): void
    {
        $user = AccountFactory::createOne();
        $room = RoomFactory::createOne();

        $response = $this->getAuthenticatedClient($user)->request('POST', '/messages', [
            'json' => [
                'content' => '',
                'room' => '/rooms/' . $room->getId()
            ]
        ]);

        $this->assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testCreateMessageInNonExistentRoom(): void
    {
        $user = AccountFactory::createOne();

        $response = $this->getAuthenticatedClient($user)->request('POST', '/messages', [
            'json' => [
                'content' => 'Hello, world!',
                'room' => '/rooms/999'
            ]
        ]);

        $this->assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }
}