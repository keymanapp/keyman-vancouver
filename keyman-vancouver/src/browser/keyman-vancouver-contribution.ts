/*
 * Keyman is copyright (C) SIL Global. MIT License.
 */

import { injectable, inject } from '@theia/core/shared/inversify';
import { Command, CommandContribution, CommandRegistry, MenuContribution, MenuModelRegistry, MessageService } from '@theia/core/lib/common';
import { CommonMenus } from '@theia/core/lib/browser';

export const KeymanVancouverCommand: Command = {
    id: 'KeymanVancouver.command',
    label: 'Say Hello'
};

@injectable()
export class KeymanVancouverCommandContribution implements CommandContribution {

    constructor(
        @inject(MessageService) private readonly messageService: MessageService,
    ) { }

    registerCommands(registry: CommandRegistry): void {
        registry.registerCommand(KeymanVancouverCommand, {
            execute: () => {
                this.messageService.info('Hello World!');

            }
        });
    }
}

@injectable()
export class KeymanVancouverMenuContribution implements MenuContribution {

    registerMenus(menus: MenuModelRegistry): void {
        menus.registerMenuAction(CommonMenus.EDIT_FIND, {
            commandId: KeymanVancouverCommand.id,
            label: KeymanVancouverCommand.label
        });
    }
}

// export const KeymanVancouverGettingStartedFactory:  WidgetFactory  = {
//     id: 'KeymanVancouver.GettingStarted',
//     createWidget: function (options?: any): MaybePromise<Widget> {

//     }
// };
