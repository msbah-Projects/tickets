const client = require("../.")
const config = client.config;
const { getTable, createEmbed,AdminTicketInfo} = require('.././functions.js');
const { Client, GatewayIntentBits, Partials,EmbedBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'AdminTicketInfo',
	permissions: [],
	run: async (client, interaction) => {
		AdminTicketInfo(interaction)
	}
};
