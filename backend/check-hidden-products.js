const mysql = require('mysql2/promise');

async function checkHiddenProducts() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'zenova_ecommerce'
    });

    try {
        const hiddenIds = ['M0100115', 'M0103950'];

        console.log('🔍 Verifica prodotti nella zona HIDDEN:\n');

        for (const id of hiddenIds) {
            const [rows] = await connection.query(
                'SELECT id, name, zenovaCategory, zenovaSubcategory FROM products WHERE id = ?',
                [id]
            );

            if (rows.length > 0) {
                const p = rows[0];
                console.log(`📦 ID: ${p.id}`);
                console.log(`   Nome: ${p.name}`);
                console.log(`   Categoria: ${p.zenovaCategory}`);
                console.log(`   Sottocategoria: ${p.zenovaSubcategory}`);
                console.log('');
            } else {
                console.log(`❌ ID: ${id} - NON TROVATO nel database`);
                console.log('');
            }
        }

    } finally {
        await connection.end();
    }
}

checkHiddenProducts().catch(console.error);
