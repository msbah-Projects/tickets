const client = require("../.")
const config = client.config;
const { getTable, createEmbed,Req_Rename} = require('.././functions.js');
const { Client, GatewayIntentBits, Partials,EmbedBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'Req_rename_Modal',
	permissions: [],
	run: async (client, interaction) => {
        const name = interaction.fields.getTextInputValue('name');

        Req_Rename(interaction,name)
    }
};
