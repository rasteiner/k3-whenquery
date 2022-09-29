<?php
namespace rasteiner\whenquery;

use Kirby\Cms\App as Kirby;
use Kirby\Form\Field\BlocksField;
use Kirby\Form\Field\LayoutField;

trait WhenQuery {
    protected ?string $whenQuery;

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
}

class QueryBlocksField extends BlocksField
{
    use WhenQuery;
    
    public function __construct($params)
    {
        parent::__construct($params);
        $this->setWhenQuery($params['whenQuery'] ?? null);
    }

    public function type(): string
    {
        return 'blocks';
    }
}

class QueryLayoutField extends LayoutField
{
    use WhenQuery;
    
    public function __construct($params)
    {
        parent::__construct($params);
        $this->setWhenQuery($params['whenQuery'] ?? null);
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