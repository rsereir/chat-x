<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Repository\RoomRepository;
use App\State\Room\JoinStateProcessor;
use App\State\Room\KickMemberStateProcessor;
use App\State\Room\LeaveStateProcessor;
use App\State\Room\NewRoomStateProcessor;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: RoomRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            normalizationContext: ['groups' => ['rooms:list']]
        ),
        new Post(
            normalizationContext: ['groups' => ['rooms:view']],
            denormalizationContext: ['groups' => ['rooms:new']],
            processor: NewRoomStateProcessor::class
        ),
        new Get(
            normalizationContext: ['groups' => ['rooms:view']]
        ),
        new Delete(
            uriTemplate: '/rooms/{id}/kick/{memberId}',
            security: "is_granted('ROLE_USER') and object.getOwner() == user",
            processor: KickMemberStateProcessor::class
        ),
        new Patch(
            uriTemplate: '/rooms/{id}/join',
            normalizationContext: ['groups' => ['rooms:view']],
            security: "is_granted('ROLE_USER')",
            processor: JoinStateProcessor::class
        ),
        new Patch(
            uriTemplate: '/rooms/{id}/leave',
            normalizationContext: ['groups' => ['rooms:view']],
            security: "is_granted('ROLE_USER') and object.getOwner() != user",
            read: true,
            write: false,
            processor: LeaveStateProcessor::class,
        )
    ]
)]
class Room
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['rooms:list', 'rooms:view'])]
    private ?int $id = null;

    #[ORM\Column(length: 15)]
    #[Groups(['rooms:list', 'rooms:view', 'rooms:new'])]
    #[Assert\NotBlank(message: 'Room name is required')]
    #[Assert\Length(
        min: 2,
        max: 15,
        minMessage: 'Room name must be at least {{ limit }} characters long',
        maxMessage: 'Room name cannot exceed {{ limit }} characters'
    )]
    private ?string $name = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['rooms:list', 'rooms:view'])]
    private ?Account $owner = null;

    /**
     * @var Collection<int, Account>
     */
    #[ORM\ManyToMany(targetEntity: Account::class, inversedBy: 'rooms')]
    #[Groups(['rooms:view', 'rooms:list'])]
    private Collection $members;

    public function __construct()
    {
        $this->members = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

        return $this;
    }

    public function getOwner(): ?Account
    {
        return $this->owner;
    }

    public function setOwner(?Account $owner): static
    {
        $this->owner = $owner;

        return $this;
    }

    /**
     * @return Collection<int, Account>
     */
    public function getMembers(): Collection
    {
        return $this->members;
    }

    public function addMember(Account $member): static
    {
        if (!$this->members->contains($member)) {
            $this->members->add($member);
        }

        return $this;
    }

    public function removeMember(Account $member): static
    {
        $this->members->removeElement($member);

        return $this;
    }
}
