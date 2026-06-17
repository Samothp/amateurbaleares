import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import { StatCard } from '../components/StatCard';
import { MessageBanner } from '../components/MessageBanner';
import { Button } from '../components/Button';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(<StatCard label="Goles" value={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Goles')).toBeInTheDocument();
  });

  it('applies custom color', () => {
    render(<StatCard label="Test" value={1} color="#ff0000" />);
    const value = screen.getByText('1');
    expect(value).toHaveStyle({ color: '#ff0000' });
  });
});

describe('MessageBanner', () => {
  it('renders nothing when no message', () => {
    const { container } = render(<MessageBanner message={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders error message with red background', () => {
    render(<MessageBanner message="Error al guardar" />);
    expect(screen.getByText('Error al guardar')).toBeInTheDocument();
  });

  it('renders success message with green background', () => {
    render(<MessageBanner message="Guardado correctamente" />);
    expect(screen.getByText('Guardado correctamente')).toBeInTheDocument();
  });
});

describe('Button', () => {
  it('renders children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('renders as button element', () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Test');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
