<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\State\UserPresence\HeartbeatStateProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Annotation\Groups;

#[ORM\Entity]
#[ORM\Table(name: 'user_presence')]
#[ORM\UniqueConstraint(name: 'user_room_unique', columns: ['user_id', 'room_id'])]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['presence:read']]
        ),
        new Post(
            processor: HeartbeatStateProcessor::class,
            denormalizationContext: ['groups' => ['presence:write']]
        )
    ]
)]
#[ApiFilter(SearchFilter::class, properties: ['room' => 'exact'])]
class UserPresence
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['presence:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Account::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['presence:read'])]
    private ?Account $user = null;

    #[ORM\ManyToOne(targetEntity: Room::class)]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['presence:read', 'presence:write'])]
    private ?Room $room = null;

    #[ORM\Column(type: 'datetime')]
    #[Groups(['presence:read'])]
    private ?\DateTimeInterface $lastSeen = null;

    #[Groups(['presence:read'])]
    private ?bool $isOnline = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUser(): ?Account
    {
        return $this->user;
    }

    public function setUser(?Account $user): static
    {
        $this->user = $user;
        return $this;
    }

    public function getRoom(): ?Room
    {
        return $this->room;
    }

    public function setRoom(?Room $room): static
    {
        $this->room = $room;
        return $this;
    }

    public function getLastSeen(): ?\DateTimeInterface
    {
        return $this->lastSeen;
    }

    public function setLastSeen(?\DateTimeInterface $lastSeen): static
    {
        $this->lastSeen = $lastSeen;
        return $this;
    }

    public function getIsOnline(): ?bool
    {
        if ($this->isOnline === null && $this->lastSeen) {
            $this->isOnline = $this->lastSeen > new \DateTime('-60 seconds');
        }
        return $this->isOnline;
    }

    public function setIsOnline(?bool $isOnline): static
    {
        $this->isOnline = $isOnline;
        return $this;
    }
}
