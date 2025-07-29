// Simple in-memory database for testing when PostgreSQL is not available
const users = [];
let userIdCounter = 1;

export const inMemoryDb = {
  users: {
    async create(userData) {
      const user = {
        id: userIdCounter++,
        ...userData,
        created_at: new Date(),
      };
      users.push(user);
      return user;
    },
    
    async findByEmail(email) {
      return users.find(user => user.email === email);
    },
    
    async count() {
      return users.length;
    },
    
    async findAll() {
      return users;
    }
  },
  
  async clear() {
    users.length = 0;
    userIdCounter = 1;
  }
};

console.log('⚠️  Using in-memory database - data will be lost on server restart');
