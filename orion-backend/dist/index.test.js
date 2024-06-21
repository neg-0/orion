var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import request from 'supertest';
import app from './index';
describe('Auth Endpoints', () => {
    it('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield request(app)
            .post('/api/register')
            .send({ username: 'testuser', password: 'password' });
        expect(res.statusCode).toEqual(201);
    }));
    it('should login a user', () => __awaiter(void 0, void 0, void 0, function* () {
        yield request(app)
            .post('/api/register')
            .send({ username: 'testuser', password: 'password' });
        const res = yield request(app)
            .post('/api/login')
            .send({ username: 'testuser', password: 'password' });
        expect(res.statusCode).toEqual(200);
    }));
});
