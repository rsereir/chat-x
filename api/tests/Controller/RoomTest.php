<?php

namespace App\Tests\Controller;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use App\Factory\AccountFactory;
use App\Factory\RoomFactory;
use Symfony\Component\HttpFoundation\Response;
use Zenstruck\Foundry\Test\Factories;
use Zenstruck\Foundry\Test\ResetDatabase;

class RoomTest extends ApiTestCase
{
    use ResetDatabase, Factories;

    private function getAuthenticatedClient($user = null)
    {
        $user = $user ?: AccountFactory::createOne();
        $client = static::createClient();
        $client->loginUser($user->_real());
        return $client;
    }

    public function testGetRoomsCollection(): void
    {
        $user = AccountFactory::createOne();
        RoomFactory::createMany(3);

        $response = $this->getAuthenticatedClient($user)->request('GET', '/rooms');

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
    }

    public function testCreateRoom(): void
    {
        $user = AccountFactory::createOne();

        $response = $this->getAuthenticatedClient($user)->request('POST', '/rooms', [
            'json' => [
                'name' => 'Test Room'
            ]
        ]);

        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
    }

    public function testGetRoom(): void
    {
        $user = AccountFactory::createOne();
        $room = RoomFactory::createOne(['owner' => $user]);

        $response = $this->getAuthenticatedClient($user)->request('GET', '/rooms/' . $room->getId());

        $this->assertResponseIsSuccessful();
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
    }

    public function testJoinRoom(): void
    {
        $owner = AccountFactory::createOne();
        $user = AccountFactory::createOne();
        $room = RoomFactory::createOne(['owner' => $owner]);

        $response = $this->getAuthenticatedClient($user)->request('PATCH', '/rooms/' . $room->getId() . '/join');

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
    }

    public function testLeaveRoom(): void
    {
        $owner = AccountFactory::createOne();
        $user = AccountFactory::createOne();
        $room = RoomFactory::createOne(['owner' => $owner]);

        $response = $this->getAuthenticatedClient($user)->request('PATCH', '/rooms/' . $room->getId() . '/leave');

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
    }

    public function testKickMember(): void
    {
        $owner = AccountFactory::createOne();
        $member = AccountFactory::createOne();
        $room = RoomFactory::createOne(['owner' => $owner]);

        $response = $this->getAuthenticatedClient($owner)->request('PATCH', '/rooms/' . $room->getId() . '/kick/' . $member->getId());

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
    }

    public function testCannotKickAsNonOwner(): void
    {
        $owner = AccountFactory::createOne();
        $user = AccountFactory::createOne();
        $member = AccountFactory::createOne();
        $room = RoomFactory::createOne(['owner' => $owner]);

        $response = $this->getAuthenticatedClient($user)->request('PATCH', '/rooms/' . $room->getId() . '/kick/' . $member->getId());

        $this->assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    public function testOwnerCannotLeaveRoom(): void
    {
        $owner = AccountFactory::createOne();
        $room = RoomFactory::createOne(['owner' => $owner]);

        $response = $this->getAuthenticatedClient($owner)->request('PATCH', '/rooms/' . $room->getId() . '/leave');

        $this->assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }
}