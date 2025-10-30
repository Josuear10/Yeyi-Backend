import 'dotenv/config';
import sql from '../config/supabase.js';

async function seedJewelryData() {
  try {
    console.log('🌱 Iniciando inserción de datos de prueba de joyería...\n');

    // Primero, obtener o crear categorías de joyería
    console.log('📦 Verificando/Creando categorías...');
    const categoryNames = [
      { name: 'Anillos', description: 'Anillos de oro y plata' },
      { name: 'Collares', description: 'Collares y gargantillas' },
      { name: 'Pulseras', description: 'Pulseras y brazaletes' },
      { name: 'Aretes', description: 'Aretes y pendientes' },
      { name: 'Relojes', description: 'Relojes de pulso y elegantes' },
    ];

    const categoryIds = [];
    for (const cat of categoryNames) {
      let category = await sql`
        SELECT cat_id FROM categories WHERE cat_name = ${cat.name} LIMIT 1
      `;
      
      if (category.length === 0) {
        const newCategory = await sql`
          INSERT INTO categories (cat_name, cat_description, cat_status)
          VALUES (${cat.name}, ${cat.description}, true)
          RETURNING cat_id
        `;
        categoryIds.push(newCategory[0].cat_id);
        console.log(`   ✓ Categoría creada: ${cat.name}`);
      } else {
        categoryIds.push(category[0].cat_id);
        console.log(`   ✓ Categoría existente: ${cat.name}`);
      }
    }

    // Insertar productos de joyería
    console.log('\n💍 Insertando productos de joyería...');
    const products = [
      // Anillos
      {
        name: 'Anillo de Oro 18k Solitario',
        description: 'Anillo elegante en oro de 18 quilates con diseño solitario clásico',
        price: 1250.00,
        stock: 15,
        cat_id: categoryIds[0],
      },
      {
        name: 'Anillo de Plata Esterlina Vintage',
        description: 'Anillo vintage en plata esterlina 925 con detalle artesanal',
        price: 450.00,
        stock: 22,
        cat_id: categoryIds[0],
      },
      {
        name: 'Anillo Compromiso Diamante',
        description: 'Anillo de compromiso con diamante central 0.5ct en oro blanco',
        price: 2850.00,
        stock: 8,
        cat_id: categoryIds[0],
      },
      // Collares
      {
        name: 'Collar de Oro con Perlas',
        description: 'Collar elegante en oro amarillo con perlas naturales de agua dulce',
        price: 980.00,
        stock: 12,
        cat_id: categoryIds[1],
      },
      {
        name: 'Collar de Plata Collar Collar',
        description: 'Collar minimalista en plata con medallón grabado personalizable',
        price: 320.00,
        stock: 30,
        cat_id: categoryIds[1],
      },
      {
        name: 'Collar Cadena de Oro 14k',
        description: 'Cadena robusta de oro de 14 quilates, 50cm de longitud',
        price: 1120.00,
        stock: 18,
        cat_id: categoryIds[1],
      },
      // Pulseras
      {
        name: 'Pulsera de Oro Tennis',
        description: 'Pulsera tennis en oro con zafiros azules, ajustable',
        price: 1650.00,
        stock: 10,
        cat_id: categoryIds[2],
      },
      {
        name: 'Pulsera de Plata con Charms',
        description: 'Pulsera de plata esterlina con charms personalizables',
        price: 280.00,
        stock: 25,
        cat_id: categoryIds[2],
      },
      {
        name: 'Brazalete de Oro Macizo',
        description: 'Brazalete sólido de oro de 18k, diseño contemporáneo',
        price: 1950.00,
        stock: 7,
        cat_id: categoryIds[2],
      },
      // Aretes
      {
        name: 'Aretes de Perlas Clásicos',
        description: 'Aretes de perlas cultivadas con montura en oro',
        price: 420.00,
        stock: 20,
        cat_id: categoryIds[3],
      },
      {
        name: 'Aretes de Diamantes Stud',
        description: 'Aretes stud con diamantes pequeños 0.25ct c/u, oro blanco',
        price: 850.00,
        stock: 14,
        cat_id: categoryIds[3],
      },
      {
        name: 'Aretes Colgantes de Plata',
        description: 'Aretes colgantes en plata con diseño geométrico moderno',
        price: 195.00,
        stock: 35,
        cat_id: categoryIds[3],
      },
      // Relojes
      {
        name: 'Reloj Elegante Oro y Cuero',
        description: 'Reloj de pulso elegante con esfera dorada y correa de cuero italiano',
        price: 750.00,
        stock: 16,
        cat_id: categoryIds[4],
      },
      {
        name: 'Reloj Deportivo Resistente Agua',
        description: 'Reloj deportivo resistente al agua hasta 100m, pantalla digital',
        price: 380.00,
        stock: 28,
        cat_id: categoryIds[4],
      },
    ];

    const productIds = [];
    for (const product of products) {
      const newProduct = await sql`
        INSERT INTO products (prod_name, prod_description, prod_price, prod_stock, cat_id)
        VALUES (${product.name}, ${product.description}, ${product.price}, ${product.stock}, ${product.cat_id})
        RETURNING prod_id
      `;
      productIds.push(newProduct[0].prod_id);
      console.log(`   ✓ Producto creado: ${product.name} - Q${product.price.toFixed(2)}`);
    }

    // Verificar o obtener empleados
    console.log('\n👤 Verificando empleados...');
    let employees = await sql`SELECT emp_id FROM employees LIMIT 5`;
    
    if (employees.length === 0) {
      console.log('   ⚠ No hay empleados. Creando empleado de prueba...');
      const newEmployee = await sql`
        INSERT INTO employees (emp_name, emp_phone, emp_email, emp_position, emp_commission, emp_is_active, emp_dpi)
        VALUES ('Empleado Demo', '1234-5678', 'empleado@yeyi.com', 'Vendedor', 5.0, 1, 1234567890123)
        RETURNING emp_id
      `;
      employees = [newEmployee[0]];
    }
    const empId = employees[0].emp_id;
    console.log(`   ✓ Usando empleado ID: ${empId}`);

    // Verificar o obtener métodos de pago
    console.log('\n💳 Verificando métodos de pago...');
    let payments = await sql`SELECT pay_id FROM payment_method LIMIT 3`;
    
    if (payments.length === 0) {
      console.log('   ⚠ No hay métodos de pago. Creando métodos de prueba...');
      const cashMethod = await sql`
        INSERT INTO payment_method (pay_method, pay_description, pay_is_active)
        VALUES ('Efectivo', 'Pago en efectivo', true)
        RETURNING pay_id
      `;
      const cardMethod = await sql`
        INSERT INTO payment_method (pay_method, pay_description, pay_is_active)
        VALUES ('Tarjeta', 'Pago con tarjeta de crédito/débito', true)
        RETURNING pay_id
      `;
      payments = [cashMethod[0], cardMethod[0]];
    }
    const cashPayId = payments[0].pay_id;
    const cardPayId = payments.length > 1 ? payments[1].pay_id : payments[0].pay_id;
    console.log(`   ✓ Métodos de pago disponibles: ${payments.length}`);

    // Crear ventas con detalles
    console.log('\n💰 Creando ventas con detalles...');
    
    const sales = [
      {
        date: '2024-12-15',
        total: 2130.00,
        pay_id: cardPayId,
        details: [
          { prod_id: productIds[0], quantity: 1, unit_price: 1250.00 }, // Anillo de Oro
          { prod_id: productIds[8], quantity: 1, unit_price: 280.00 },  // Pulsera de Plata
          { prod_id: productIds[10], quantity: 2, unit_price: 300.00 }, // Aretes (2x150 = 300, pero ajustamos)
        ],
      },
      {
        date: '2024-12-14',
        total: 2850.00,
        pay_id: cashPayId,
        details: [
          { prod_id: productIds[2], quantity: 1, unit_price: 2850.00 }, // Anillo Compromiso
        ],
      },
      {
        date: '2024-12-13',
        total: 1370.00,
        pay_id: cardPayId,
        details: [
          { prod_id: productIds[4], quantity: 1, unit_price: 320.00 }, // Collar de Plata
          { prod_id: productIds[6], quantity: 1, unit_price: 1650.00 }, // Pulsera Tennis
        ],
      },
      {
        date: '2024-12-12',
        total: 2340.00,
        pay_id: cardPayId,
        details: [
          { prod_id: productIds[3], quantity: 1, unit_price: 980.00 }, // Collar de Oro
          { prod_id: productIds[9], quantity: 2, unit_price: 850.00 }, // Aretes Diamantes (2x850)
        ],
      },
      {
        date: '2024-12-11',
        total: 1120.00,
        pay_id: cashPayId,
        details: [
          { prod_id: productIds[5], quantity: 1, unit_price: 1120.00 }, // Cadena de Oro
        ],
      },
      {
        date: '2024-12-10',
        total: 750.00,
        pay_id: cardPayId,
        details: [
          { prod_id: productIds[12], quantity: 1, unit_price: 750.00 }, // Reloj Elegante
        ],
      },
      {
        date: '2024-12-09',
        total: 640.00,
        pay_id: cashPayId,
        details: [
          { prod_id: productIds[1], quantity: 1, unit_price: 450.00 }, // Anillo Plata
          { prod_id: productIds[11], quantity: 1, unit_price: 195.00 }, // Aretes Colgantes
        ],
      },
      {
        date: '2024-12-08',
        total: 1950.00,
        pay_id: cardPayId,
        details: [
          { prod_id: productIds[7], quantity: 1, unit_price: 1950.00 }, // Brazalete Oro
        ],
      },
    ];

    // Ajustar totales de ventas basados en detalles reales
    for (let sale of sales) {
      sale.total = sale.details.reduce((sum, det) => sum + (det.unit_price * det.quantity), 0);
    }

    const saleIds = [];
    for (const sale of sales) {
      // Crear la venta
      const newSale = await sql`
        INSERT INTO sales (emp_id, sale_date, sale_total, pay_id)
        VALUES (${empId}, ${sale.date}, ${sale.total}, ${sale.pay_id})
        RETURNING sale_id
      `;
      const saleId = newSale[0].sale_id;
      saleIds.push(saleId);

      // Crear detalles de la venta
      for (const detail of sale.details) {
        const subtotal = detail.unit_price * detail.quantity;
        await sql`
          INSERT INTO details (sale_id, prod_id, det_quantity, det_unit_price, det_subtotal)
          VALUES (${saleId}, ${detail.prod_id}, ${detail.quantity}, ${detail.unit_price}, ${subtotal})
        `;
      }

      const productNames = sale.details
        .map(d => products.find(p => p.name === products[productIds.indexOf(d.prod_id)]?.name || 'Producto'))
        .join(', ');
      console.log(`   ✓ Venta creada: ${sale.date} - Q${sale.total.toFixed(2)} (${sale.details.length} producto(s))`);
    }

    console.log(`\n✅ ¡Datos de prueba insertados exitosamente!`);
    console.log(`\n📊 Resumen:`);
    console.log(`   • Categorías: ${categoryIds.length}`);
    console.log(`   • Productos: ${productIds.length}`);
    console.log(`   • Ventas: ${saleIds.length}`);
    console.log(`   • Total de detalles: ${sales.reduce((sum, s) => sum + s.details.length, 0)}`);

  } catch (error) {
    console.error('❌ Error insertando datos:', error);
    throw error;
  }
}

// Ejecutar el script
seedJewelryData()
  .then(() => {
    console.log('\n🎉 Proceso completado exitosamente!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Error en el proceso:', error);
    process.exit(1);
  });

