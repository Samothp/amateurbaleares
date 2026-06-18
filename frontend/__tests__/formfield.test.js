import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/jest-globals';
import { FormField } from '../components/FormField';

describe('FormField', () => {
  it('renders label', () => {
    render(<FormField label="Nombre" value="" onChange={() => {}} />);
    expect(screen.getByText('Nombre')).toBeInTheDocument();
  });

  it('renders input element', () => {
    render(<FormField label="Email" value="test@x.com" onChange={() => {}} />);
    const input = screen.getByDisplayValue('test@x.com');
    expect(input).toBeInTheDocument();
    expect(input.type).toBe('text');
  });

  it('renders password input when type is password', () => {
    render(<FormField label="Pass" type="password" value="" onChange={() => {}} />);
    expect(screen.getByLabelText(/Pass/)).toHaveAttribute('type', 'password');
  });

  it('calls onChange when typing', () => {
    const onChange = jest.fn();
    render(<FormField label="Name" value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'abc' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('shows required asterisk', () => {
    render(<FormField label="Email" value="" onChange={() => {}} required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('does not show error before blur', () => {
    render(<FormField label="Name" value="" onChange={() => {}} required />);
    expect(screen.queryByText(/obligatorio/)).not.toBeInTheDocument();
  });

  it('shows required error after blur when empty', () => {
    render(<FormField label="Name" value="" onChange={() => {}} required />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(screen.getByText('Name es obligatorio')).toBeInTheDocument();
  });

  it('shows minLength error after blur', () => {
    render(<FormField label="Pass" value="ab" onChange={() => {}} required minLength={6} />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(screen.getByText('Mínimo 6 caracteres')).toBeInTheDocument();
  });

  it('clears error after valid input', () => {
    const { rerender } = render(<FormField label="Name" value="" onChange={() => {}} required />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(screen.getByText('Name es obligatorio')).toBeInTheDocument();

    rerender(<FormField label="Name" value="abc" onChange={() => {}} required />);
    fireEvent.blur(screen.getByRole('textbox'));
    expect(screen.queryByText(/obligatorio/)).not.toBeInTheDocument();
  });

  it('renders select when options provided', () => {
    const options = [
      { value: 'a', label: 'Option A' },
      { value: 'b', label: 'Option B' },
    ];
    render(<FormField label="Rol" value="" onChange={() => {}} options={options} />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Option A')).toBeInTheDocument();
  });

  it('renders disabled input', () => {
    render(<FormField label="Email" value="x@y.com" onChange={() => {}} disabled />);
    expect(screen.getByDisplayValue('x@y.com')).toBeDisabled();
  });

  it('renders disabled select', () => {
    const options = [{ value: 'a', label: 'A' }];
    render(<FormField label="Role" value="a" onChange={() => {}} options={options} disabled />);
    expect(screen.getByRole('combobox')).toBeDisabled();
  });

  it('displays external error', () => {
    render(<FormField label="Email" value="bad" onChange={() => {}} error="Email inválido" />);
    expect(screen.getByText('Email inválido')).toBeInTheDocument();
  });
});
