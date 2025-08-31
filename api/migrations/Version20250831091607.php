<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250831091607 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE account (id SERIAL NOT NULL, username VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_IDENTIFIER_USERNAME ON account (username)');
        $this->addSql('CREATE TABLE message (id SERIAL NOT NULL, author_id INT NOT NULL, room_id INT NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_B6BD307FF675F31B ON message (author_id)');
        $this->addSql('CREATE INDEX IDX_B6BD307F54177093 ON message (room_id)');
        $this->addSql('CREATE TABLE room (id SERIAL NOT NULL, owner_id INT NOT NULL, name VARCHAR(15) NOT NULL, PRIMARY KEY(id))');
        $this->addSql('CREATE INDEX IDX_729F519B7E3C61F9 ON room (owner_id)');
        $this->addSql('CREATE TABLE room_account (room_id INT NOT NULL, account_id INT NOT NULL, PRIMARY KEY(room_id, account_id))');
        $this->addSql('CREATE INDEX IDX_9114EA4454177093 ON room_account (room_id)');
        $this->addSql('CREATE INDEX IDX_9114EA449B6B5FBA ON room_account (account_id)');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307FF675F31B FOREIGN KEY (author_id) REFERENCES account (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE message ADD CONSTRAINT FK_B6BD307F54177093 FOREIGN KEY (room_id) REFERENCES room (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE room ADD CONSTRAINT FK_729F519B7E3C61F9 FOREIGN KEY (owner_id) REFERENCES account (id) NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE room_account ADD CONSTRAINT FK_9114EA4454177093 FOREIGN KEY (room_id) REFERENCES room (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
        $this->addSql('ALTER TABLE room_account ADD CONSTRAINT FK_9114EA449B6B5FBA FOREIGN KEY (account_id) REFERENCES account (id) ON DELETE CASCADE NOT DEFERRABLE INITIALLY IMMEDIATE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE SCHEMA public');
        $this->addSql('ALTER TABLE message DROP CONSTRAINT FK_B6BD307FF675F31B');
        $this->addSql('ALTER TABLE message DROP CONSTRAINT FK_B6BD307F54177093');
        $this->addSql('ALTER TABLE room DROP CONSTRAINT FK_729F519B7E3C61F9');
        $this->addSql('ALTER TABLE room_account DROP CONSTRAINT FK_9114EA4454177093');
        $this->addSql('ALTER TABLE room_account DROP CONSTRAINT FK_9114EA449B6B5FBA');
        $this->addSql('DROP TABLE account');
        $this->addSql('DROP TABLE message');
        $this->addSql('DROP TABLE room');
        $this->addSql('DROP TABLE room_account');
    }
}
