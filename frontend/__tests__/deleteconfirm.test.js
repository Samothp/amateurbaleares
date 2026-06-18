import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import { DeleteConfirm } from '../components/DeleteConfirm';

describe('DeleteConfirm', () => {
  it('renders item name', () => {
    render(<DeleteConfirm name="Mi Equipo" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByText(/Mi Equipo/)).toBeInTheDocument();
  });

  it('renders warning text', () => {
    render(<DeleteConfirm name="Test" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByText(/no se puede deshacer/)).toBeInTheDocument();
  });

  it('calls onConfirm when confirm clicked', () => {
    const onConfirm = jest.fn();
    render(<DeleteConfirm name="X" onConfirm={onConfirm} onCancel={() => {}} />);
    screen.getByText('Sí, eliminar').click();
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel clicked', () => {
    const onCancel = jest.fn();
    render(<DeleteConfirm name="X" onConfirm={() => {}} onCancel={onCancel} />);
    screen.getByText('Cancelar').click();
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('renders both buttons', () => {
    render(<DeleteConfirm name="X" onConfirm={() => {}} onCancel={() => {}} />);
    expect(screen.getByRole('button', { name: /Sí, eliminar/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancelar/ })).toBeInTheDocument();
  });
});
