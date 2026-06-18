import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import GoogleLogo from '../components/GoogleLogo';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { Skeleton, SkeletonCard, SkeletonList } from '../components/Skeleton';

describe('GoogleLogo', () => {
  it('renders SVG element', () => {
    const { container } = render(<GoogleLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders with default size 20', () => {
    const { container } = render(<GoogleLogo />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '20');
    expect(svg).toHaveAttribute('height', '20');
  });

  it('renders with custom size', () => {
    const { container } = render(<GoogleLogo size={32} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('contains 4 colored paths', () => {
    const { container } = render(<GoogleLogo />);
    const paths = container.querySelectorAll('path');
    expect(paths.length).toBe(4);
  });
});

describe('SearchBar', () => {
  it('renders input with placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Buscar jugadores" />);
    expect(screen.getByPlaceholderText('Buscar jugadores')).toBeInTheDocument();
  });

  it('renders with aria-label', () => {
    render(<SearchBar value="" onChange={() => {}} placeholder="Buscar" />);
    expect(screen.getByLabelText('Buscar')).toBeInTheDocument();
  });

  it('displays current value', () => {
    render(<SearchBar value="test" onChange={() => {}} />);
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    const handleChange = jest.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledWith('test');
  });

  it('shows clear button when value exists', () => {
    render(<SearchBar value="hello" onChange={() => {}} />);
    expect(screen.getByLabelText('Borrar búsqueda')).toBeInTheDocument();
  });

  it('does not show clear button when empty', () => {
    render(<SearchBar value="" onChange={() => {}} />);
    expect(screen.queryByLabelText('Borrar búsqueda')).not.toBeInTheDocument();
  });
});

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalItems: 50,
    pageSize: 10,
    onPageChange: jest.fn(),
  };

  it('renders page info text', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByText(/Mostrando/)).toBeInTheDocument();
  });

  it('renders navigation landmark', () => {
    render(<Pagination {...defaultProps} />);
    expect(screen.getByRole('navigation', { name: 'Paginación' })).toBeInTheDocument();
  });

  it('highlights current page', () => {
    render(<Pagination {...defaultProps} currentPage={2} />);
    const currentPageBtn = screen.getByLabelText('Página 2');
    expect(currentPageBtn).toHaveAttribute('aria-current', 'page');
  });

  it('disables previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />);
    expect(screen.getByLabelText('Página anterior')).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />);
    expect(screen.getByLabelText('Página siguiente')).toBeDisabled();
  });
});

describe('Skeleton components', () => {
  it('Skeleton renders with aria-hidden', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('SkeletonCard renders with aria-busy', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toHaveAttribute('aria-busy', 'true');
  });

  it('SkeletonCard renders with loading label', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toHaveAttribute('aria-label', 'Cargando...');
  });

  it('SkeletonList renders correct number of cards', () => {
    const { container } = render(<SkeletonList count={3} />);
    const cards = container.querySelectorAll('[aria-busy="true"]');
    expect(cards.length).toBe(3);
  });
});
