<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\MessageRepository;
use App\State\Message\NewStateProcessor;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: MessageRepository::class)]
#[ApiResource(
    operations: [
        new GetCollection(
            uriTemplate: '/messages',
            paginationItemsPerPage: 10,
            paginationMaximumItemsPerPage: 10,
            normalizationContext: ['groups' => ['messages:list']],
        ),
        new Get(),
        new Post(processor: NewStateProcessor::class)
    ]
)]
#[ApiFilter(SearchFilter::class, properties: ['room' => 'exact'])]
class Message
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['messages:list'])]
    private ?int $id = null;

    #[ORM\Column(type: 'text')]
    #[Groups(['messages:list'])]
    private ?string $content = null;

    #[ORM\Column(type: 'datetime_immutable')]
    #[Groups(['messages:list'])]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['messages:list'])]
    private ?Account $author = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['messages:list'])]
    private ?Room $room = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getContent(): ?string
    {
        return $this->content;
    }

    public function setContent(string $content): static
    {
        $this->content = $content;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getAuthor(): ?Account
    {
        return $this->author;
    }

    public function setAuthor(?Account $author): static
    {
        $this->author = $author;

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
}
