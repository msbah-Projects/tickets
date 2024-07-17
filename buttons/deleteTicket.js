const client = require("../.")
const config = client.config;
const { getTable, DeleteTicket} = require('.././functions.js');
const { Client, GatewayIntentBits, Partials,EmbedBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'deleteTicket',
	permissions: [],
	run: async (client, interaction) => {
		DeleteTicket(interaction)	
	}
};
