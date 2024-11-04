/*
 * Keyman is copyright (C) SIL Global. MIT License.
 */

import * as vscode from 'vscode';
import { LdmlEditorProvider } from './ldmleditor';
import { KpjTaskProvider } from './kpjTasks';

/** for cleaning up the kpj provider */
let kpjTaskProvider: vscode.Disposable | undefined;

/** called when extension is activated */
export function activate(context: vscode.ExtensionContext) {
	// TASK STUFF
	kpjTaskProvider = vscode.tasks.registerTaskProvider('kpj', KpjTaskProvider);

	// LDML EDITOR STUFF
	context.subscriptions.push(LdmlEditorProvider.register(context));
}

/** called when extension is deactivated */
export function deactivate() {
	if (kpjTaskProvider) {
		kpjTaskProvider.dispose();
	}
}
