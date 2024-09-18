var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import knex from './knex';
function showMigrationResult(label, [batch, migrations]) {
    if (migrations.length === 0) {
        console.log('No migrations affected.');
        return;
    }
    console.log(label, 'batch:', batch);
    console.log('migrations:');
    console.log(migrations.map((s) => '- ' + s).join('\n'));
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const args = process.argv.slice(2);
        if (args.length == 0) {
            console.error('Error: missing knex command in argument');
            return;
        }
        switch (args[0]) {
            case 'migrate:up': {
                showMigrationResult('migrate:up', yield knex.migrate.up());
                break;
            }
            case 'migrate:down': {
                showMigrationResult('migrate:down', yield knex.migrate.down());
                break;
            }
            case 'migrate:latest': {
                showMigrationResult('migrate:latest', yield knex.migrate.latest());
                break;
            }
            case 'migrate:rollback': {
                const config = undefined;
                const all = args[1] === '--all';
                showMigrationResult('rollback', yield knex.migrate.rollback(config, all));
                break;
            }
            case 'migrate:status': {
                const [done, pending] = (yield knex.migrate.list());
                console.log(done.length, 'applied migrations');
                for (const each of done) {
                    console.log('- ' + each.name);
                }
                console.log(pending.length, 'pending migrations');
                for (const each of pending) {
                    console.log('- ' + each.file);
                }
                break;
            }
            case 'migrate:make': {
                const result = yield knex.migrate.make(args[1], { extension: 'ts' });
                console.log(result);
                break;
            }
            default: {
                console.error('Error: unknown arguments:', args);
            }
        }
    });
}
main()
    .catch((e) => console.error(e))
    .then(() => knex.destroy());
