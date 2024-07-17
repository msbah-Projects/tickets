const client = require("../index.js")
const config = client.config;
const { getTable, createEmbed,Remove_members_select} = require('../functions.js');
const { Client, GatewayIntentBits, Partials,EmbedBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'remove_member',
	permissions: [],
	run: async (client, interaction) => {

		Remove_members_select(interaction)
	}
};
