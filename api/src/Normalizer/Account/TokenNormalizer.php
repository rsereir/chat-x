<?php

namespace App\Normalizer\Account;

use App\Entity\Account;
use App\Normalizer\SupportNormalization;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareInterface;
use Symfony\Component\Serializer\Normalizer\NormalizerAwareTrait;
use Symfony\Component\Serializer\Normalizer\NormalizerInterface;

final class TokenNormalizer implements NormalizerInterface, NormalizerAwareInterface
{
    use NormalizerAwareTrait;

    private const ALREADY_CALLED = 'ACCOUNT_TOKEN_ALREADY_CALLED';

    public function __construct(
        private readonly Security $security,
        private readonly JWTTokenManagerInterface $JWTManager,
    ) {
    }

    /**
     * @throws ExceptionInterface
     */
    public function normalize(mixed $account, ?string $format = null, array $context = []): array
    {
        $context[self::ALREADY_CALLED] = true;

        $account->token = $this->JWTManager->create($account);

        return $this->normalizer->normalize($account, $format, $context);
    }

    public function supportsNormalization(mixed $data, ?string $format = null, array $context = []): bool
    {
        // Prevent infinite loop
        if (isset($context[self::ALREADY_CALLED])) {
            return false;
        }

        if (!$data instanceof Account) {
            return false;
        }

        if (!SupportNormalization::byProperty($data, 'token', $context)) {
            return false;
        }

        return true;
    }

    public function getSupportedTypes(?string $format): array
    {
        return [Account::class => false];
    }
}
