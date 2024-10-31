/*
 * Keyman is copyright (C) SIL Global. MIT License.
 */

const {path} = require('node:path');
const { existsSync } = require('node:fs');
import * as vscode from 'vscode';
import { LdmlEditorProvider } from './ldmleditor';
// import {declareBuild  } from '@keymanapp/kmc/build/src/commands/build.js';
// import { CompilerOptions, CompilerCallbackOptions } from '@keymanapp/developer-utils';
// import { NodeCompilerCallbacks } from '@keymanapp/kmc/build/src/util/NodeCompilerCallbacks';

let kpjPromise: Thenable<vscode.Task[]> | undefined = undefined;

async function buildProject(infile: string) : Promise<boolean> {
	// const outfile = '';
	// const coptions : CompilerCallbackOptions = {
	// };
	// const options : CompilerOptions = {
	// };
	// const callbacks = new NodeCompilerCallbacks(coptions);

	// const resp = await (new BuildProject().build(
	// 	infile,
	// 	<string><unknown>undefined,
	// 	callbacks,
	// 	options
	// ));

	// // dump all
	// callbacks.messages?.forEach(m => console.dir(m));
	const resp = false;

	return resp;
}

interface KpjTaskDefinition extends vscode.TaskDefinition {
	// empty for now
}

let kpjTaskProvider : vscode.Disposable | undefined;

class KpjBuildTerminal implements vscode.Pseudoterminal {
	private writeEmitter = new vscode.EventEmitter<string>();
	onDidWrite: vscode.Event<string> = this.writeEmitter.event;
	private closeEmitter = new vscode.EventEmitter<number>();
	onDidClose?: vscode.Event<number> = this.closeEmitter.event;

	private fileWatcher: vscode.FileSystemWatcher | undefined;

	constructor(private workspaceRoot: string, private flavor: string, private flags: string[], private getSharedState: () => string | undefined, private setSharedState: (state: string) => void) {
	}

	open(initialDimensions: vscode.TerminalDimensions | undefined): void {
		// At this point we can start using the terminal.
		if (this.flags.indexOf('watch') > -1) {
			const pattern = path.join(this.workspaceRoot, 'customBuildFile');
			this.fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
			this.fileWatcher.onDidChange(() => this.doBuild());
			this.fileWatcher.onDidCreate(() => this.doBuild());
			this.fileWatcher.onDidDelete(() => this.doBuild());
		}
		this.doBuild();
	}


	close(): void {
		// The terminal has been closed. Shutdown the build.
		if (this.fileWatcher) {
			this.fileWatcher.dispose();
		}
	}

	private async doBuild(): Promise<void> {
		return new Promise<void>((resolve) => {
			this.writeEmitter.fire('Starting build...\r\n');
			let isIncremental = this.flags.indexOf('incremental') > -1;
			if (isIncremental) {
				if (this.getSharedState()) {
					this.writeEmitter.fire('Using last build results: ' + this.getSharedState() + '\r\n');
				} else {
					isIncremental = false;
					this.writeEmitter.fire('No result from last build. Doing full build.\r\n');
				}
			}

			// Since we don't actually build anything in this example set a timeout instead.
			setTimeout(() => {
				const date = new Date();
				this.setSharedState(date.toTimeString() + ' ' + date.toDateString());
				this.writeEmitter.fire('Build complete.\r\n\r\n');
				if (this.flags.indexOf('watch') === -1) {
					this.closeEmitter.fire(0);
					resolve();
				}
			}, isIncremental ? 1000 : 4000);
		});
	}
}


async function getKpjTasks(): Promise<vscode.Task[]> {
	const workspaceFolders = vscode.workspace.workspaceFolders;
	const result: vscode.Task[] = [];
	console.log('Hulla0');
	// vscode.window.showInformationMessage('Hulla00');
	if (!workspaceFolders || workspaceFolders.length === 0) {
		console.log('H0ll0');
		vscode.window.showInformationMessage('H0ll0!');

		return result;
	}
	for (const workspaceFolder of workspaceFolders) {
		const folderString = workspaceFolder.uri.fsPath;
		if (!folderString) {
			vscode.window.showInformationMessage('!folstr!');

			console.log(`Not folstr`);
			continue;
		}
		const dir = path.basename(folderString);
		const kpjFile = path.join(folderString, `${dir}.kpj`);
		if (!existsSync(kpjFile)) {
			vscode.window.showInformationMessage(`not ${kpjFile}`);

			console.log(`Not exist ${kpjFile}`);
			continue;
		} else {
			vscode.window.showInformationMessage(`=> ${kpjFile}`);
			console.log(`=> ${kpjFile}`);
		}
		const task = new vscode.Task({type: 'kpj'}, workspaceFolder, dir, 'kpj',
				new vscode.CustomExecution(async (definition) => new KpjBuildTerminal('hallo', '', [], ()=>undefined, (state)=>undefined))
				// new vscode.ShellExecution(`npx -y @keymanapp/kmc build file ${kpjFile}`)
			);
		task.group = vscode.TaskGroup.Build;
		console.dir({task});
		result.push(task);
	}
	return result;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	let NEXT_TERM_ID = 1;

	// console.log("Terminals: " + (<any>vscode.window).terminals.length);

	// vscode.window.onDidOpenTerminal(terminal => {
	// 	console.log("Terminal opened. Total count: " + (<any>vscode.window).terminals.length);
	// });
	// vscode.window.onDidOpenTerminal((terminal: vscode.Terminal) => {
	// 	vscode.window.showInformationMessage(`onDidOpenTerminal, name: ${terminal.name}`);
	// });

	// // vscode.window.onDidChangeActiveTerminal
	// vscode.window.onDidChangeActiveTerminal(e => {
	// 	console.log(`Active terminal changed, name=${e ? e.name : 'undefined'}`);
	// });

	let sharedState : string | undefined = undefined; // TODO should be class scoped on the TaskProvider


	kpjTaskProvider = vscode.tasks.registerTaskProvider('kpj', {

		// TODO should be TaskProvider subclass

		provideTasks() {
			vscode.window.showInformationMessage('GettinTasks!');

			console.log("Gettin' tasks");
			return (kpjPromise = kpjPromise ?? getKpjTasks());
		},
		resolveTask(_task: vscode.Task) : vscode.Task | undefined {
			const task = _task.definition.task;
			if (task) {
				const definition: KpjTaskDefinition = <any>_task.definition;
				return new vscode.Task(
					definition,
					_task.scope ?? vscode.TaskScope.Workspace,
					definition.type, // for now, se don't have another name to use
					'kpj',
					new vscode.CustomExecution(
						async (): Promise<vscode.Pseudoterminal> => {
							return new KpjBuildTerminal("something", "something", ["something"], () => sharedState, (state: string) => sharedState = state);
						}
					)
					// OLD: shell
					// new vscode.ShellExecution(`npx -y @keymanapp/kmc build`) // nothing from the definition for now
				);
			}
		}
	});

	console.log('Congratulations, your extension "keyman-kpj" is now active!');

	const disposable = vscode.commands.registerCommand('keyman.compileProject', () => {
		// const terminal = vscode.window.createTerminal(`Keyman Compile #${NEXT_TERM_ID++}`);
		// terminal.show();
		// terminal.sendText("echo 'Sent text immediately after creating'", true);
		vscode.window.showInformationMessage('Compiled Project from Keyman Project File Editor!');
	});

	context.subscriptions.push(disposable);

	// LDML EDITOR STUFF
	context.subscriptions.push(LdmlEditorProvider.register(context));
}

// This method is called when your extension is deactivated
export function deactivate() {
	if (kpjTaskProvider) {
		kpjTaskProvider.dispose();
	}
	console.log(`Keyman: goodbye!`);
}

// function ensureTerminalExists(): boolean {
// 	if ((<any>vscode.window).terminals.length === 0) {
// 		vscode.window.showErrorMessage('No active terminals');
// 		return false;
// 	}
// 	return true;
// }
