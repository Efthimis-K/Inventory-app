const pool = require("./pool");

async function seedDatabase() {
  try {
    console.log("Seeding database...");

    // Insert categories
    const categories = [
      { name: "Smartphones", description: "Mobile phones and accessories" },
      { name: "Laptops", description: "Portable computers and notebooks" },
      { name: "Audio", description: "Headphones, speakers, and audio equipment" },
      { name: "Gaming", description: "Gaming consoles, controllers, and accessories" },
      { name: "Cameras", description: "Digital cameras and photography equipment" },
    ];

    const categoryIds = [];
    for (const category of categories) {
      const result = await pool.query(
        "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id",
        [category.name, category.description]
      );
      categoryIds.push(result.rows[0].id);
      console.log(`Created category: ${category.name}`);
    }

    // Insert items for each category
    const items = [
      // Smartphones
      { name: "iPhone 15 Pro", description: "Latest Apple smartphone", price: 999.99, quantity: 25, sku: "IPH-15PRO", brand: "Apple", categoryId: categoryIds[0] },
      { name: "Samsung Galaxy S24", description: "Premium Android smartphone", price: 899.99, quantity: 30, sku: "SAM-GS24", brand: "Samsung", categoryId: categoryIds[0] },
      { name: "Google Pixel 8", description: "Google's flagship phone", price: 699.99, quantity: 20, sku: "GOO-PIX8", brand: "Google", categoryId: categoryIds[0] },
      
      // Laptops
      { name: "MacBook Pro 14\"", description: "Apple professional laptop", price: 1999.99, quantity: 15, sku: "MBP-14", brand: "Apple", categoryId: categoryIds[1] },
      { name: "Dell XPS 15", description: "Windows ultrabook", price: 1499.99, quantity: 18, sku: "DEL-XPS15", brand: "Dell", categoryId: categoryIds[1] },
      { name: "Lenovo ThinkPad X1", description: "Business laptop", price: 1599.99, quantity: 12, sku: "LEN-TPX1", brand: "Lenovo", categoryId: categoryIds[1] },
      
      // Audio
      { name: "Sony WH-1000XM5", description: "Noise-canceling headphones", price: 349.99, quantity: 40, sku: "SON-WH1000", brand: "Sony", categoryId: categoryIds[2] },
      { name: "AirPods Pro", description: "Apple wireless earbuds", price: 249.99, quantity: 50, sku: "APP-PRO", brand: "Apple", categoryId: categoryIds[2] },
      { name: "Bose SoundLink Max", description: "Portable Bluetooth speaker", price: 449.99, quantity: 25, sku: "BOS-SLM", brand: "Bose", categoryId: categoryIds[2] },
      
      // Gaming
      { name: "PlayStation 5", description: "Sony gaming console", price: 499.99, quantity: 20, sku: "PS5-STD", brand: "Sony", categoryId: categoryIds[3] },
      { name: "Xbox Series X", description: "Microsoft gaming console", price: 499.99, quantity: 18, sku: "XBX-SX", brand: "Microsoft", categoryId: categoryIds[3] },
      { name: "Nintendo Switch OLED", description: "Hybrid gaming console", price: 349.99, quantity: 25, sku: "NSW-OLED", brand: "Nintendo", categoryId: categoryIds[3] },
      
      // Cameras
      { name: "Canon EOS R5", description: "Professional mirrorless camera", price: 3899.99, quantity: 8, sku: "CAN-EOSR5", brand: "Canon", categoryId: categoryIds[4] },
      { name: "Sony A7 IV", description: "Full-frame mirrorless camera", price: 2499.99, quantity: 10, sku: "SON-A7IV", brand: "Sony", categoryId: categoryIds[4] },
      { name: "GoPro Hero 12", description: "Action camera", price: 399.99, quantity: 30, sku: "GOP-H12", brand: "GoPro", categoryId: categoryIds[4] },
    ];

    for (const item of items) {
      await pool.query(
        "INSERT INTO items (name, description, price, quantity, sku, brand, category_id) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [item.name, item.description, item.price, item.quantity, item.sku, item.brand, item.categoryId]
      );
      console.log(`Created item: ${item.name}`);
    }

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await pool.end();
  }
}

seedDatabase();
