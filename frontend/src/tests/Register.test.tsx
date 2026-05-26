import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../pages/Register';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';

const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock useAuth context hook
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock api/axios
vi.mock('../api/axios', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Register Component', () => {
  const mockGoogleLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAuth as any).mockReturnValue({
      googleLogin: mockGoogleLogin,
    });
  });

  it('renders registration form components successfully', () => {
    render(<Register />);

    expect(screen.getByPlaceholderText('Іван Іваненко')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Зареєструватись' })).toBeInTheDocument();
  });

  it('displays validation error if any fields are blank', () => {
    render(<Register />);

    const registerBtn = screen.getByRole('button', { name: 'Зареєструватись' });
    fireEvent.click(registerBtn);

    expect(screen.getByText('Заповніть всі поля')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('calls auth registration API and redirects to login on success', async () => {
    (api.post as any).mockResolvedValueOnce({ data: { message: 'Success' } });
    render(<Register />);

    const fullNameInput = screen.getByPlaceholderText('Іван Іваненко');
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const registerBtn = screen.getByRole('button', { name: 'Зареєструватись' });

    fireEvent.change(fullNameInput, { target: { value: 'Олег Петренко' } });
    fireEvent.change(emailInput, { target: { value: 'oleg@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'securepwd' } });
    fireEvent.click(registerBtn);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        full_name: 'Олег Петренко',
        email: 'oleg@example.com',
        password: 'securepwd',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('handles backend registration failure correctly', async () => {
    const errorResponse = {
      response: {
        data: {
          error: 'Цей Email вже зареєстровано',
        },
      },
    };
    (api.post as any).mockRejectedValueOnce(errorResponse);
    render(<Register />);

    const fullNameInput = screen.getByPlaceholderText('Іван Іваненко');
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('••••••••');
    const registerBtn = screen.getByRole('button', { name: 'Зареєструватись' });

    fireEvent.change(fullNameInput, { target: { value: 'Олег Петренко' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'securepwd' } });
    fireEvent.click(registerBtn);

    await waitFor(() => {
      expect(screen.getByText('Цей Email вже зареєстровано')).toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
