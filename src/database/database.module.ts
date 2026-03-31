import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Global()          // makes SupabaseService available everywhere
@Module({
  providers: [SupabaseService],
  exports:   [SupabaseService],
})
export class DatabaseModule {}
