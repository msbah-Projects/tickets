const client = require("../.")
const config = client.config;
const { getTable, createEmbed,Transcript} = require('.././functions.js');
const { Client, GatewayIntentBits, Partials,EmbedBuilder,TextInputStyle,TextInputBuilder,ModalBuilder,PermissionsBitField,ChannelType,WebhookClient,ActivityType, Collection , StringSelectMenuOptionBuilder, ButtonBuilder, ActionRowBuilder,ButtonStyle, SlashCommandBuilder,StringSelectMenuBuilder} = require('discord.js');

module.exports = {
	id: 'transcript',
	permissions: [],
	run: async (client, interaction) => {
		Transcript(interaction).then(test => {
			if(test != undefined){
				test.reply({ content: 'تم اخذ نسخه بنجاح',ephemeral: true  });

			}
		})
	}
};
