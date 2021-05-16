import {Command, flags} from '@oclif/command'
import * as Parser from '@oclif/parser'
import axios from 'axios'
import cli from 'cli-ux'

interface PatreonPledgesResp {
  data: {
    attributes: {
      amount_cents: number;
      created_at: string;
      currency: string;
    };
    id: string;
    relationships: {
      campaign: {
        data: {
          id: string;
          type: string;
        };
        links: {
          related: string;
        };
      };
    };
  }[];
  included: {
    attributes: {
      currency: string;
      creation_name: string;
      is_charge_upfront: boolean;
      is_charged_immediately: boolean;
      is_monthly: boolean;
      name: string;
      one_liner: string;
      outstanding_payment_amount_cents: number;
      patron_count: number;
      pay_per_name: string;
      pledge_sum: number;
      pledge_sum_currency: string;
      published_at: string;
      summary: string;
      url: string;
    };
    id: string;
    type: string;
  }[];
}

interface FanboxSupportingResp {
  body: {
    coverImageUrl: string;
    creatorId: string;
    description: string;
    fee: number;
    hasAdultContent: boolean;
    id: string;
    paymentMethod: string;
    title: string;
    user: {
      iconUrl: string;
      name: string;
      userId: string;
    };
  }[];
}

class Subcount extends Command {
  static description = 'Count your subscriptions on Patreon and Fanbox'

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({char: 'v'}),
    help: flags.help({char: 'h'}),

    fanbox: flags.boolean({char: 'f', description: 'enable checking Fanbox'}),
    patreon: flags.boolean({char: 'p', description: 'enable checking Patreon'}),
    ...cli.table.flags()
  }

  static args: Parser.args.Input = [
    {
      name: 'apikey',
      required: true,
      description: 'Hydrus API key'
    },
    {
      name: 'apiurl',
      default: 'http://localhost:45869',
      description: 'Hydrus API URL',
      parse: input => input.replace(/\/$/, '')
    },
  ]

  async run() {
    const {args, flags} = this.parse(Subcount)
    if (flags.patreon) {
      await this.getPatreon(args.apiurl, args.apikey, flags);
    }
    if (flags.fanbox) {
      await this.getFanbox(args.apiurl, args.apikey, flags);
    }
  }

  async getPatreon(apiUrl: string, apiKey: string, flags: any) {
    cli.action.start('Checking Patreon');
    const cookies = await this.getCookies(apiUrl, apiKey, 'patreon.com');
    const patreonResp = await axios.get<PatreonPledgesResp>('https://www.patreon.com/api/pledges', {
      headers: {
        Cookie: cookies
      },
      params: {
        include: 'campaign',
        'json-api-use-default-includes': 'false'
      }
    })
    const patreonData = patreonResp.data;

    const patreonPairs = patreonData.data.map(data => {
      const campaign = patreonData.included.find(c => c.id === data.relationships.campaign.data.id);

      return {
        pledge: {
          ...data.attributes,
          id: data.id
        },
        campaign: {
          name: campaign?.attributes.name,
          id: campaign?.id,
          url: campaign?.attributes.url
        }
      };
    });

    const tableData = patreonPairs.map(({pledge, campaign}) => ({
      name: campaign.name,
      pledge: `${pledge.amount_cents / 100} ${pledge.currency}`,
      url: campaign.url
    }));

    cli.action.stop();

    cli.table(tableData, {
      name: {

      },
      pledge: {

      },
      url: {
        extended: true,
        header: 'URL'
      }
    }, {
      printLine: this.log,
      ...flags, // parsed flags
    });

    const patreonTotal = patreonPairs.map(p => p.pledge.amount_cents).reduce((p, c) => p + c, 0);

    this.log(`Patreon ${patreonPairs.length} subs total: ${patreonTotal / 100}`);
    this.log('');
  }

  async getFanbox(apiUrl: string, apiKey: string, flags: any) {
    cli.action.start('Checking Fanbox');
    const cookies = await this.getCookies(apiUrl, apiKey, 'fanbox.cc');
    const fanboxResp = await axios.get<FanboxSupportingResp>('https://api.fanbox.cc/plan.listSupporting', {
      headers: {
        Cookie: cookies,
        referer: 'https://www.fanbox.cc/',
        origin: 'https://www.fanbox.cc'
      },
    })
    const fanboxData = fanboxResp.data.body;

    const tableData = fanboxData.map(pledge => ({
      name: pledge.user.name + (pledge.user.name === pledge.creatorId ? '' : ` (${pledge.creatorId})`),
      pledge: `${pledge.fee} JPY`,
      url: `https://fanbox.cc/@${pledge.creatorId}`
    }));

    cli.action.stop();

    cli.table(tableData, {
      name: {

      },
      pledge: {

      },
      url: {
        extended: true,
        header: 'URL'
      }
    }, {
      printLine: this.log,
      ...flags, // parsed flags
    });

    const fanboxTotal = fanboxData.map(p => p.fee).reduce((p, c) => p + c, 0);

    this.log(`Fanbox ${fanboxData.length} subs total: ${fanboxTotal} JPY`);
    this.log('');
  }

  async getCookies(apiUrl: string, apiKey: string, domain: string) {
    const hydrusResponse = await axios.get(apiUrl + '/manage_cookies/get_cookies', {
      params: {
        domain
      },
      headers: {
        'Hydrus-Client-API-Access-Key': apiKey
      }
    })
    const cookies: string[][] = hydrusResponse.data.cookies;
    return cookies.map(cookie => `${cookie[0]}=${cookie[1]}`).join('; ');
  }
}

export = Subcount
