import React from 'react';
import { Pagination, ButtonGroup, IconButton } from '@chakra-ui/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlProps {
  count: number;
  pageSize: number;
  page: number;
  onPageChange: (page: number) => void;
}

export const PaginationControl: React.FC<PaginationControlProps> = ({
  count,
  pageSize,
  page,
  onPageChange,
}) => {
  const totalPages = Math.ceil(count / pageSize);

  if (totalPages <= 1) return null;

  return (
    <Pagination.Root
      count={count}
      pageSize={pageSize}
      page={page}
      onPageChange={(e: { page: number }) => onPageChange(e.page)}
    >
      <ButtonGroup
        display="flex"
        justifyContent="center"
        alignItems="center"
        variant="outline"
        size="sm"
        gap={4}
      >
        <Pagination.PrevTrigger asChild>
          <IconButton
            variant="ghost"
            disabled={page === 1}
            aria-label="Previous page"
          >
            <ChevronLeft />
          </IconButton>
        </Pagination.PrevTrigger>

        <Pagination.Items
          render={(p) => (
            <IconButton
              variant="outline"
              _selected={{ borderColor: 'neutral.800' }}
            >
              {p.value}
            </IconButton>
          )}
        />

        <Pagination.NextTrigger asChild>
          <IconButton
            variant="ghost"
            disabled={page === totalPages}
            aria-label="Next page"
          >
            <ChevronRight />
          </IconButton>
        </Pagination.NextTrigger
      </ButtonGroup>
    </Pagination.Root>
  );
};
