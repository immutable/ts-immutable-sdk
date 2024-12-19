import type { Pool } from 'pg';

export const migrationPersistence = (client: Pool) => {
  return {
    insertMigration: async (migrationData: {
      x_collection_address: string;
      zkevm_collection_address: string;
      zkevm_wallet_address: string;
      token_id: string;
      status: string;
    }) => {
      const result = await client.query(
        `
        INSERT INTO migrations (x_collection_address, zkevm_collection_address, zkevm_wallet_address, token_id, status) 
        VALUES ($1, $2, $3, $4, $5);
        `,
        [
          migrationData.x_collection_address,
          migrationData.zkevm_collection_address,
          migrationData.zkevm_wallet_address,
          migrationData.token_id,
          migrationData.status,
        ]
      );
      return result.rowCount !== null && result.rowCount > 0;
    },

    getMigration: async (tokenId: string, options?: { xCollectionAddress?: string; zkevmCollectionAddress?: string }) => {
      let query = `
        SELECT * FROM migrations WHERE token_id = $1
      `;
      let values = [tokenId];

      if (options?.xCollectionAddress) {
        query += ` AND x_collection_address = $2;`;
        values.push(options.xCollectionAddress);
      } else if (options?.zkevmCollectionAddress) {
        query += ` AND zkevm_collection_address = $2;`;
        values.push(options.zkevmCollectionAddress);
      }

      const res = await client.query(query, values);
      return res.rows[0] || null;
    },

    getAllPendingMigrations: async () => {
      const res = await client.query(
        `
        SELECT * FROM migrations WHERE status = 'pending';
        `
      );
      return res.rows || [];
    },

    updateMigration: async (id: string, updateData: Partial<{
      status?: string;
      burn_id?: string;
    }>) => {
      const fields = Object.keys(updateData).map((key, index) => `${key} = $${index + 2}`).join(', ');
      const values = [id, ...Object.values(updateData)];
      const result = await client.query(
        `
        UPDATE migrations 
        SET ${fields} 
        WHERE id = $1;
        `,
        values
      );
      return result.rowCount !== null && result.rowCount > 0;
    },
  };
}; 