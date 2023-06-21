import { DataSource } from "typeorm";
import { InjectDataSource } from "@nestjs/typeorm";

export class TestRepo {
  constructor(@InjectDataSource() protected dataSource : DataSource) {
  }
  async sqlTest() {
    return this.dataSource.query(`
    SELECT *
    FROM public."Test";
    `)
  }
}