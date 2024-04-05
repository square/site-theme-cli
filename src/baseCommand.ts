import {
	Command, Flags, Interfaces,
} from '@oclif/core';
import { showBanner } from './components/ui/display/Banner.js';
import { strings, substituteValues } from './translations/index.js';
import { ProcessFileLogger } from './utilities/filesystem.js';
import log from './components/ui/display/Log.js';

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<typeof BaseCommand['baseFlags'] & T['flags']>
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

export abstract class BaseCommand<T extends typeof Command> extends Command {
	// define flags that can be inherited by any command that extends BaseCommand
	static baseFlags = {
		verbose: Flags.boolean({
			description: strings.global.flags.verbose,
			default: false,
			helpGroup: 'GLOBAL',
		}),
	}

	static hasShownBanner = false;

	protected flags!: Flags<T>
	protected args!: Args<T>

	public verbose = false;
	static permissionScopes: string[] = [];

	public fileLogger: ProcessFileLogger | undefined;

	public async init(): Promise<void> {
		await super.init();
		this.fileLogger = new ProcessFileLogger(`${this.config.dataDir}/logs/`);
		const { args, flags } = await this.parse({
			flags: this.ctor.flags,
			baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
			args: this.ctor.args,
			strict: this.ctor.strict,
		});
		this.flags = flags as Flags<T>;
		this.args = args as Args<T>;
		if (!BaseCommand.hasShownBanner) {
			await showBanner();
			BaseCommand.hasShownBanner = true;
		}

		this.verbose = flags.verbose;
	}

	protected async catch(err: Error & {exitCode?: number}): Promise<any> {
		// Log error to disk.
		await (this.fileLogger as ProcessFileLogger).logError(err);
		return super.catch(err);
	}

	protected async finally(_: Error | undefined): Promise<any> {
		if ((this.fileLogger as ProcessFileLogger).getHasLoggedError()) {
			log(substituteValues(strings.global.errorLogMessage, {
				logPath: (this.fileLogger as ProcessFileLogger).errorLogFilePath,
			}), 'error');
		}
	}
}
