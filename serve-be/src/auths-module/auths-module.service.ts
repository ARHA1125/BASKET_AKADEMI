import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthsModuleService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, role, fullName, phoneNumber } = registerDto;
    
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role,
      fullName,
      phoneNumber: phoneNumber?.replace('+62', '0'),
    });

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      throw new ConflictException('Could not register user');
    }
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;
    const user = await this.userRepository.findOne({ where: { email } });
        
    if (user && (await bcrypt.compare(password, user.password))) {
            if (user.status && user.status !== 'Active') {
                throw new UnauthorizedException('Account is pending approval or inactive.');
            }
            const payload = { sub: user.id, email: user.email, role: user.role };
            const accessToken = await this.jwtService.signAsync(payload);
            return { accessToken };
        }

    throw new UnauthorizedException('Invalid credentials');
  }

  async getProfile(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['studentProfile', 'parentProfile'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async updateProfileImage(userId: string, photoUrl: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.photo_url = photoUrl;
    return this.userRepository.save(user);
  }


  async findAllUsers(page = 1, limit = 10, search = '') {
      const query = this.userRepository.createQueryBuilder('user');

      if (search) {
          query.where('user.fullName ILIKE :search OR user.email ILIKE :search', { search: `%${search}%` });
      }
      
      const [data, total] = await query
          .skip((page - 1) * limit)
          .take(limit)
          .orderBy('user.createdAt', 'DESC')
          .getManyAndCount();

      return { data, total, page, limit };
  }

  async updateUser(id: string, dto: any) {
      const user = await this.userRepository.findOne({ where: { id } });
      if (!user) throw new UnauthorizedException('User not found');

      if (dto.password) {
          const salt = await bcrypt.genSalt();
          dto.password = await bcrypt.hash(dto.password, salt);
      }

      if (dto.phoneNumber) {
        dto.phoneNumber = dto.phoneNumber.replace('+62', '0');
      }

      Object.assign(user, dto);
      return this.userRepository.save(user);
  }
}
