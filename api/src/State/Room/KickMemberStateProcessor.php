<?php

namespace App\State\Room;

use ApiPlatform\Doctrine\Common\State\PersistProcessor;
use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\Room;
use App\Repository\AccountRepository;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

final class KickMemberStateProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly PersistProcessor $decorator,
        private readonly AccountRepository $accountRepository,
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Room
    {
        $memberId = (int) $uriVariables['memberId'];
        $memberToKick = $this->accountRepository->find($memberId);

        if (!$memberToKick) {
            throw new NotFoundHttpException('Member not found');
        }

        $data->removeMember($memberToKick);

        return $this->decorator->process($data, $operation, $uriVariables, $context);
    }
}
