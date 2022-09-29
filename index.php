<?php
namespace rasteiner\whenquery;

use Kirby\Cms\App as Kirby;
use Kirby\Form\Field\BlocksField;
use Kirby\Form\Field\LayoutField;

class QueryBlocksField extends BlocksField
{
    protected ?string $whenQuery;

    public function __construct($params)
    {
        parent::__construct($params);
        $this->setWhenQuery($params['whenQuery'] ?? null);
    }

    public function setWhenQuery(?string $query)
    {
        $this->whenQuery = $query;
    }

    public function whenQuery(): ?string
    {
        return $this->whenQuery;
    }

    public function props(): array 
    {
        return [
            'whenQuery' => $this->whenQuery(),
        ] + parent::props();
    }

    public function type(): string
    {
        return 'blocks';
    }
}

class QueryLayoutField extends LayoutField
{
    protected ?string $whenQuery;

    public function __construct($props)
    {
        parent::__construct($props);
        $this->setWhenQuery($props['whenQuery'] ?? null);
    }

    public function setWhenQuery(?string $query)
    {
        $this->whenQuery = $query;
    }

    public function whenQuery(): ?string
    {
        return $this->whenQuery;
    }

    public function props(): array 
    {
        return [
            'whenQuery' => $this->whenQuery(),
        ] + parent::props();
    }

    public function type(): string
    {
        return 'layout';
    }
}

Kirby::plugin('rasteiner/whenquery', [
   'fields' => [
        'blocks' => QueryBlocksField::class,
        'layout' => QueryLayoutField::class,
    ],
]);