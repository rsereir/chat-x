<?php

namespace App\Tests\Controller;

use ApiPlatform\Symfony\Bundle\Test\ApiTestCase;
use App\Factory\AccountFactory;
use Symfony\Component\HttpFoundation\Response;
use Zenstruck\Foundry\Test\Factories;
use Zenstruck\Foundry\Test\ResetDatabase;

class AuthTest extends ApiTestCase
{
    use ResetDatabase, Factories;

    public function testRegisterSuccess(): void
    {
        $response = static::createClient()->request('POST', '/register', [
            'json' => [
                'username' => 'testuser',
                'plainPassword' => 'password123'
            ]
        ]);

        $this->assertResponseStatusCodeSame(Response::HTTP_CREATED);
        $this->assertResponseHeaderSame('content-type', 'application/ld+json; charset=utf-8');
        $this->assertJsonContains(['token' => '@string@']);
    }

    public function testRegisterWithExistingUsername(): void
    {
        AccountFactory::createOne(['username' => 'existinguser']);

        static::createClient()->request('POST', '/register', [
            'json' => [
                'username' => 'existinguser',
                'plainPassword' => 'password123'
            ]
        ]);

        $this->assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testRegisterWithInvalidData(): void
    {
        static::createClient()->request('POST', '/register', [
            'json' => [
                'username' => '',
                'plainPassword' => '123'
            ]
        ]);

        $this->assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testLogin(): void
    {
        AccountFactory::createOne([
            'username' => 'testuser',
            'password' => '$2y$13$password_hash'
        ]);

        $response = static::createClient()->request('POST', '/login', [
            'json' => [
                'username' => 'testuser',
                'password' => 'password123'
            ]
        ]);

        $this->assertResponseStatusCodeSame(Response::HTTP_OK);
    }
}