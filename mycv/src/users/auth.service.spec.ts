import { Test } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { UsersService } from "./users.service";
import { User } from "./user.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";

describe('AuthService', () => {
    let service: AuthService;
    let fakeUsersService: Partial<UsersService>;

    beforeEach(async () => {
        //Create a fake copy of the users service
        const users: User[] = [];
        fakeUsersService = {
            find: (email: string) => {
                const filteredUsers = users.filter(user => user.email === email); //filter the users array to find the user with the given email
                return Promise.resolve(filteredUsers);
            },
            create: (email: string, password: string) => {
                const user = {id: Math.floor( Math.random() * 999999), email, password} as User; //create a new user with a random id
                users.push(user); //add the user to the users array
                return Promise.resolve(user); //return the user
            }
        };
    
        const module = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: fakeUsersService
                }
            ]
        }).compile();
    
        service = module.get(AuthService);
    });
    
    it('can create an instance of auth service', async () => {
        expect(service).toBeDefined();
    });

    //SIGN UP TESTS
    it('creates a new user with a salted and hashed password', async() => {
        const user = await service.signup('asdf@asdf.com', 'asdf'); 
        //making sure password was salted and hashed in some way
        expect(user.password).not.toEqual('asdf');
        const [salt,hash] = user.password.split('.');
        expect(salt).toBeDefined();
        expect(hash).toBeDefined();
    });

    it('throws an error if user signs up with email that is in use', async() => {
        await service.signup('asdf@asdf.com', 'asdf'); //sign up with email
        await expect(service.signup('asdf@asdf.com', 'asdf')).rejects.toThrow(BadRequestException); //throw a BadRequestException if signing up with an email that is already in use
    });

    //SIGN IN TESTS

    it('throws an error if signin is called with an unused email', async() => {
        await expect( service.signin('asdflk@asdflk.com', 'asdflk')).rejects.toThrow(NotFoundException); //throw an NotFoundException if signing in with unused email
    });

    it('throws an error if an invalid password is provided', async() => {
        await service.signup('laskdjf@alskdjf.com', 'password'); //sign up with email and password
        await expect(service.signin('laskdjf@alskdjf.com', 'wrongpassword')).rejects.toThrow(BadRequestException); //throw a BadRequestException if signing in with wrong password
    });

    it('returns a user if correct password is provided', async() => {
        await service.signup('asdf@asdf.com', 'mypassword');
        const user = await service.signin('asdf@asdf.com', 'mypassword'); //sign in with correct password
        expect(user).toBeDefined(); //make sure user is defined
    }); 
});