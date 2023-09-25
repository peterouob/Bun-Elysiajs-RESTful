import { Database } from 'bun:sqlite'

export interface Book {
    id?: number;
    name: string;
    author: string;
}

export class BookDatabase {
    private db: Database;

    constructor() {
        this.db = new Database('books.db');
        this.init().then(() => { console.log('db init ....') }).catch(console.error)
    }

    async getBooks() {
        return this.db.query('SELECT * FROM books').all()
    }
    async addBook(book: Book) {
        return this.db.query('INSERT INTO books (name,author) VALUES(?,?) RETURNING id').get(book.name, book.author) as Book
    }

    async updateBook(id: number, book: Book) {
        return this.db.query(`UPDATE books SET name = '${book.name}',author = '${book.author}' WHERE id = '${id}' `)
    }
    async deleteBook(id: number) {
        return this.db.run(`DELETE FROM books WHERE id = ${id}`)
    }
    async getBookByID(id: number) {
        return this.db.query(`SELECT * FROM books WHERE id = '${id}' `).get() as Book
    }
    async init() {
        return this.db.run('CREATE TABLE IF NOT EXISTS books (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,author TEXT)')
    }
}