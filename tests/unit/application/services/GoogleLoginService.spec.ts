import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GoogleLoginService } from '../../../../src/application/services/GoogleLoginService';
import { InMemoryUserRepository } from '../../helpers/InMemoryUserRepository';
import { JwtService } from '../../../../src/infrastructure/auth/jwt';
import { PasswordHasher } from '../../../../src/infrastructure/auth/hash';
import { InterfaceGoogleAuthProvider } from '../../../../src/domain/repositories/InterfaceGoogleAuthProvider';
import { User } from '../../../../src/domain/entities/User';

describe('GoogleLoginService', () => {
    let googleLoginService: GoogleLoginService;
    let userRepository: InMemoryUserRepository;
    let googleAuthProvider: InterfaceGoogleAuthProvider;
    let jwtService: JwtService;
    let passwordHasher: PasswordHasher;

    beforeEach(() => {
        userRepository = new InMemoryUserRepository();
        
        // Mock GoogleAuthProvider
        googleAuthProvider = {
            verifyToken: vi.fn(),
        } as any;

        jwtService = {
            generateToken: vi.fn().mockResolvedValue('fake-jwt-token'),
        } as any;

        passwordHasher = {
            hash: vi.fn().mockResolvedValue('hashed-random-password'),
        } as any;

        googleLoginService = new GoogleLoginService(
            userRepository,
            googleAuthProvider,
            jwtService,
            passwordHasher
        );
    });

    it('deve realizar login de um usuário Google existente', async () => {
        const existingUser = new User('uuid-1', 'Guga', 'guga@gmail.com', 'pwd', 'COMMON');
        userRepository.users.push(existingUser);

        vi.mocked(googleAuthProvider.verifyToken).mockResolvedValue({
            sub: 'google-sub-123',
            email: 'guga@gmail.com',
            name: 'Guga',
        });

        const result = await googleLoginService.login('id-token-valid');

        expect(result.token).toBe('fake-jwt-token');
        expect(result.user).toBe('Guga');
        expect(userRepository.users).toHaveLength(1); // Não deve criar novo usuário
    });

    it('deve criar um novo usuário ao realizar login com Google pela primeira vez', async () => {
        vi.mocked(googleAuthProvider.verifyToken).mockResolvedValue({
            sub: 'google-sub-456',
            email: 'novo@gmail.com',
            name: 'Novo Usuario',
        });

        const result = await googleLoginService.login('id-token-new');

        expect(result.token).toBe('fake-jwt-token');
        expect(result.user).toBe('Novo Usuario');
        
        const createdUser = await userRepository.findByEmail('novo@gmail.com');
        expect(createdUser).toBeDefined();
        expect(createdUser?.name).toBe('Novo Usuario');
    });

    it('deve lançar erro se o token do Google for inválido', async () => {
        vi.mocked(googleAuthProvider.verifyToken).mockRejectedValue(new Error('Invalid Google Token'));

        await expect(googleLoginService.login('id-token-invalid')).rejects.toThrow('Invalid Google Token');
    });
});
