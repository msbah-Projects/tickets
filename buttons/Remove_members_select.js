const client = require("../.")
const config = client.config;
const { getTable, createEmbed,Remove_members} = require('.././functions.js');
const { Client, GatewayIntentBits, Partials,EmbedBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'remove_member_select',
	permissions: [],
	run: async (client, interaction) => {

        Remove_members(interaction,interaction.values)

    }
};