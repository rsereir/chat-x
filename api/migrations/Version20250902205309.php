<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250902205309 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE user_presence (id SERIAL NOT NULL, user_id INT NOT NULL, room_id INT NOT NULL, last_seen TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_89FA23A5A76ED395 ON user_presence (user_id)');
        $this->addSql('CREATE INDEX IDX_89FA23A554177093 ON user_presence (room_id)');
        $this->addSql('CREATE UNIQUE INDEX user_room_unique ON user_presence (user_id, room_id)');
        $this->addSql('ALTER TABLE user_presence ADD CONSTRAINT FK_89FA23A5A76ED395 FOREIGN KEY (user_id) REFERENCES account (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE user_presence ADD CONSTRAINT FK_89FA23A554177093 FOREIGN KEY (room_id) REFERENCES room (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE user_presence DROP CONSTRAINT FK_89FA23A5A76ED395');
        $this->addSql('ALTER TABLE user_presence DROP CONSTRAINT FK_89FA23A554177093');
        $this->addSql('DROP TABLE user_presence');
    }
}
