<?php

namespace App\Normalizer;

use Symfony\Component\Serializer\Attribute\Groups;

class SupportNormalization
{
    public static function byProperty(object $data, string $propertyName, array $context): bool
    {
        try {
            if (!property_exists($data, $propertyName)) {
                return false;
            }

            if (!self::hasGroupAttributes(new \ReflectionProperty(get_class($data), $propertyName), $context)) {
                return false;
            }
        } catch (\Throwable) {
            return false;
        }

        return true;
    }

    private static function hasGroupAttributes(\ReflectionProperty|\ReflectionMethod $reflection, array $context): bool
    {
        $attributes = $reflection->getAttributes(Groups::class);
        $groupAttributes = [];

        foreach ($attributes as $attribute) {
            if (Groups::class === $attribute->getName()) {
                $groupAttributes = array_merge($groupAttributes, ...$attribute->getArguments());
                break;
            }
        }

        return count(array_intersect($groupAttributes, $context['groups'])) > 0;
    }

    public static function byMethod(object $data, string $methodName, array $context): bool
    {
        try {
            if (!method_exists($data, $methodName)) {
                return false;
            }

            if (!self::hasGroupAttributes(new \ReflectionMethod(get_class($data), $methodName), $context)) {
                return false;
            }
        } catch (\Throwable) {
            return false;
        }

        return true;
    }
}
