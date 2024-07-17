const client = require("../.")
const config = client.config;
const { getTable, createEmbed} = require('.././functions.js');
const { Client, GatewayIntentBits,UserSelectMenuBuilder, Partials,EmbedBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'req_add_member',
	permissions: [],
	run: async (client, interaction) => {
        const embed = await createEmbed("Add member", "الرجاء اختيار الأعضاء من الأسفل",interaction);

        const userSelect = new UserSelectMenuBuilder()
        .setCustomId('req_add_member_select')
        .setPlaceholder('الرجاء اختيار الأعضاء.')
        .setMinValues(1)
        .setMaxValues(10);
        const row = new ActionRowBuilder()
			.addComponents(userSelect);

            await interaction.reply({
                embeds:[embed],
                components: [row],
                ephemeral:true,
            });
    }
};
