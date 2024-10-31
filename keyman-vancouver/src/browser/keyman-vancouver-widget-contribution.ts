/*
 * Keyman is copyright (C) SIL Global. MIT License.
 */

import { Command, CommandRegistry } from "@theia/core";
import { AbstractViewContribution } from "@theia/core/lib/browser";
import { KeymanVancouverGettingStarted } from "./keyman-vancouver-widget";

export const KeymanVancouverGettingStartedWidgetCommand: Command = { id: 'widget:command' };
export class MyWidgetContribution extends AbstractViewContribution<KeymanVancouverGettingStarted> {
   constructor() {
       super({
           widgetId: KeymanVancouverGettingStarted.ID,
           widgetName: KeymanVancouverGettingStarted.LABEL,
           defaultWidgetOptions: { area: 'left' },
           toggleCommandId: KeymanVancouverGettingStartedWidgetCommand.id
       });
   }

   registerCommands(commands: CommandRegistry): void {
       commands.registerCommand(KeymanVancouverGettingStartedWidgetCommand, {
           execute: () => super.openView({ activate: false, reveal: true })
       });
   }
}
