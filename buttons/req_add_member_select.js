const client = require("../.")
const config = client.config;
const { getTable, createEmbed,Req_Add_members} = require('.././functions.js');
const { Client, GatewayIntentBits, Partials,EmbedBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'req_add_member_select',
	permissions: [],
	run: async (client, interaction) => {

        Req_Add_members(interaction,interaction.values)

    }
};
